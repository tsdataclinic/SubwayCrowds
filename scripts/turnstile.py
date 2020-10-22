import pandas as pd
import numpy as np
import sys, logging
from datetime import datetime, timedelta
import seaborn as sns
import matplotlib.pyplot as plt
import re
import os
import bisect
import io
import logging
import re
import requests

from ast import literal_eval
from datetime import datetime, timedelta
from html.parser import HTMLParser
from typing import List, Dict

# This module provides methods that handles MTA turnstile data


def _process_raw_data(raw_data: pd.DataFrame, group_by: List[str]) -> pd.DataFrame:
    logging.getLogger().info("Cleaning turnstile data")

    # create datetime from DATE and TIME columns
    processed = raw_data.assign(
        datetime=pd.to_datetime(
            raw_data['DATE'] + " " + raw_data['TIME'],
            format="%m/%d/%Y %H:%M:%S"))

    # remove mysterious duplicate index along STATION + UNIT
    processed = processed.groupby(
        group_by + ['datetime']).sum().reset_index()

    processed = processed.set_index(pd.DatetimeIndex(processed.datetime))
    processed.drop(columns=['datetime'], inplace=True)

    # clean up whitespace in the columns
    processed.rename(columns={c: c.strip()
                              for c in processed.columns}, inplace=True)

    return processed


def _process_grouped_data(grouped: pd.DataFrame,
                          frequency: str) -> pd.DataFrame:
    # calculate the diff and take the absolute value
    entry_diffs = grouped.ENTRIES.diff()
    exit_diffs = grouped.EXITS.diff()

    # clean up data
    # grouped.loc[entry_diffs < 0, 'entry_diffs'] = np.nan
    # grouped.loc[exit_diffs < 0, 'exit_diffs'] = np.nan
    # grouped.loc[entry_diffs > 10000, 'entry_diffs'] = np.nan
    # grouped.loc[exit_diffs > 10000, 'exit_diffs'] = np.nan

    entry_diffs = pd.Series([np.nan if (x < 0)|(x>10000) else x for x in entry_diffs])
    exit_diffs = pd.Series([np.nan if (x < 0)|(x>10000) else x for x in exit_diffs])

    # restore cumulative data
    cleaned_entries = entry_diffs.cumsum()
    cleaned_exits = exit_diffs.cumsum()

    # assign new columns
    grouped = grouped.assign(
        entry_diffs=entry_diffs.values,
        exit_diffs=exit_diffs.values,
        cleaned_entries=cleaned_entries.values,
        cleaned_exits=cleaned_exits.values,
    )

    resampled = grouped.resample(frequency).asfreq()
    interpolated_group = pd.concat([resampled, grouped])
    interpolated_group = interpolated_group.loc[~interpolated_group.index.duplicated(
        keep='first')]
    interpolated_group = interpolated_group.sort_index(ascending=True)
    if interpolated_group[interpolated_group.cleaned_entries.notnull()].shape[0] > 2:
        interpolated_group.cleaned_entries.interpolate(
            method='quadratic', inplace=True)
    else:
        interpolated_group.cleaned_entries.interpolate(
            method='linear', inplace=True)

    if interpolated_group[interpolated_group.cleaned_exits.notnull()].shape[0] > 2:
        interpolated_group.cleaned_exits.interpolate(method='quadratic', inplace=True)
    else:
        interpolated_group.cleaned_exits.interpolate(method='linear', inplace=True)

    interpolated_group = interpolated_group.assign(
        estimated_entries=interpolated_group.cleaned_entries.diff(),
        estimated_exits=interpolated_group.cleaned_exits.diff())
    interpolated_group.fillna(method='ffill', inplace=True)
    interpolated_group = interpolated_group.loc[resampled.index]
    interpolated_group.drop(
        columns=[
            "ENTRIES",
            "EXITS",
            "cleaned_entries",
            "cleaned_exits"],
        inplace=True)
    return interpolated_group


def _interpolate(intervalized_data: pd.DataFrame,
                 group_by: List[str],
                 frequency: str) -> pd.DataFrame:
    logging.getLogger().info("Start interpolating turnstile data")

    interpolated = []
    intervalized_data.groupby(group_by).apply(
        lambda g: interpolated.append(_process_grouped_data(g, frequency)))
    logging.getLogger().info("Finish interpolating")
    result = pd.concat(interpolated)
    logging.getLogger().info("Finish concatenating the result")

    return result


class TurnstilePageParser(HTMLParser):
    def __init__(self, start_date, end_date=None):
        super().__init__()
        self.start_date = start_date
        self.end_date = end_date
        self.href = False
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            for name, value in attrs:
                if name == "href":
                    self.href = True
                    self.link = value

    def handle_endtag(self, tag):
        if tag == "a":
            self.href = False

    def handle_data(self, data):
        if self.href:
            try:
                d = datetime.strptime(data.strip(), '%A, %B %d, %Y')
            except ValueError:
                pass
            else:
                self.links.append((d, self.link))

    def get_all_links(self):
        self.links.sort(key=lambda r: r[0])
        keys = [r[0] for r in self.links]
        lower = bisect.bisect_left(keys, self.start_date)
        if lower != len(keys):
            lower = max(
                0, lower - 1) if keys[lower] == self.start_date else lower
        else:
            lower = 0

        upper = len(keys) - 1
        if self.end_date:
            upper = bisect.bisect_right(keys, self.end_date)
            if upper != len(keys):
                upper = min(len(keys) - 1, upper +
                            1) if keys[upper] == self.end_date else upper
            else:
                upper = len(keys) - 1
        return [r[1] for r in self.links[lower:upper + 1]]


def download_turnstile_data(start_date: datetime,
                            end_date: datetime = None) -> pd.DataFrame:
    """
    Download raw turnstile data from http://web.mta.info/developers/turnstile.html

    Parameters
    start_date: datatime
    end_date: datetime, optional

    Return
    pandas.DataFrame

    """
    logging.getLogger().info("Downloading turnstile data")
    mta_link_rook = 'http://web.mta.info/developers/'
    start_page = requests.get(mta_link_rook + 'turnstile.html')
    parser = TurnstilePageParser(start_date, end_date)
    parser.feed(start_page.content.decode('utf-8'))
    dfs = [
        pd.read_csv(
            io.StringIO(
                requests.get(
                    mta_link_rook +
                    l).content.decode('utf-8'))) for l in parser.get_all_links()]
    return pd.concat(dfs)


def create_interpolated_turnstile_data(
        start_date: datetime,
        end_date: datetime = None,
        group_by: List[str] = ['UNIT', 'SCP'],
        frequency: str = '1H') -> pd.DataFrame:
    """
    Create interpolated turnstile data

    Raw turnstile data is downloaded from http://web.mta.info/developers/turnstile.html
    For each turnstile unit, the differences of ENTRIES/EXITS are taken between two snapshots
    and large difference (>= 10000) and negative values are set to zero.
    The cleaned data is linearly interpolated using the frequency provided

    Parameters
    start_date : datetime
    end_date : datetime, optional
    group_by : List(str), optional
    frequency: str, optional

    Returns
    dataframe
    [group_by_keys: List[str]
     estimated_entries: int
     estimated_exits: int]

    """

    if not set(group_by).issubset(['STATION', 'LINENAME', 'UNIT', 'SCP']):
        raise Exception("Unsupported group by keys: " + str(group_by))


    raw = download_turnstile_data(start_date, end_date)
    raw['date'] = pd.to_datetime(raw.DATE)
    raw = raw[(raw.date <= (end_date + timedelta(1))) & (raw.date >= (start_date - timedelta(1)))]
    raw.drop('date',axis=1,inplace=True)

    interpolated = _interpolate(_process_raw_data(raw, group_by), group_by, frequency)
    end_date = end_date or interpolated.index.max()
    return interpolated[interpolated.index.to_series().between(
        start_date, end_date)] .drop(columns=["entry_diffs", "exit_diffs"])


def aggregate_turnstile_data_by_station(turnstile_data: pd.DataFrame,
                                        output_directory: str = None) -> Dict[str,
                                                                              pd.DataFrame]:
    """
    aggregate turnstile data by station and save to output directory if passed.

    Parameters
    turnstile_data: pandas.DataFram
    output_directory: str, optional - If specified, the data by station will be saved under the specified directory.


    Return
    dict[station_name:str, station_turnstile_data: pd.DataFrame] will be returned.

    """

    aggregated_by_station = turnstile_data.groupby(
        ['datetime', 'STATION','LINENAME']).sum().reset_index()
    turnstile_by_station = {
        re.sub(
            r"\s+",
            '_',
            re.sub(
                r"[/|-]",
                " ",
                '_'.join(station))) +
        ".csv": df for (
            station,
            df) in aggregated_by_station.groupby(
            ['STATION','LINENAME'])}
    if output_directory:
        if not os.path.exists(output_directory):
            os.mkdir(output_directory)
        for key in turnstile_by_station:
            d = turnstile_by_station[key]
            d.to_csv(
                os.path.join(
                    output_directory.strip('/'),
                    '/') + key,
                index=False)
    return turnstile_by_station


def pre_interpolation_fix(turnstile_data_raw, pct_6=0.1, pct_9=0.4):
    '''
    Pre-interpolation adjustments for turnstile data for better interpolated estimates during rush-hour 
    - Imputing values for 6am to be 10% of the entries/exits between 4 and 8am
    - Imputing values for 9am to be 40% of the entries/exits between 8am and 12pm
    '''
    turnstile_data_raw = turnstile_data_raw.reset_index()
    turnstile_data_raw = turnstile_data_raw.sort_values('datetime')
    turnstile_resampled = turnstile_data_raw.copy()
    
    turnstile_data_raw['entry_diff'] = turnstile_data_raw.groupby(['STATION','LINENAME','UNIT']).ENTRIES.diff()
    turnstile_data_raw['exit_diff'] = turnstile_data_raw.groupby(['STATION','LINENAME','UNIT']).EXITS.diff()
    turnstile_data_raw = turnstile_data_raw[(turnstile_data_raw.entry_diff >= 0)&(turnstile_data_raw.entry_diff < 10000)&(turnstile_data_raw.entry_diff >= -10000)]
    turnstile_data_raw = turnstile_data_raw.drop(columns=['entry_diff','exit_diff'])

    turnstile_resampled['entry_diff'] = turnstile_resampled.groupby(['STATION','LINENAME','UNIT']).ENTRIES.diff()
    turnstile_resampled['exit_diff'] = turnstile_resampled.groupby(['STATION','LINENAME','UNIT']).EXITS.diff()
    turnstile_resampled = turnstile_resampled[(turnstile_resampled.entry_diff >= 0)&(turnstile_resampled.entry_diff < 10000)&(turnstile_resampled.entry_diff >= -10000)]

    
    turnstile_resampled = turnstile_resampled.set_index('datetime').groupby(['STATION','LINENAME','UNIT']).resample('1H').asfreq().drop(columns=['STATION','LINENAME','UNIT']).reset_index()
    turnstile_resampled['hour'] = turnstile_resampled.datetime.dt.hour
    turnstile_resampled['weekday'] = turnstile_resampled.datetime.dt.weekday
    turnstile_resampled['ENTRIES'] = turnstile_resampled.groupby(['STATION','LINENAME','UNIT']).ENTRIES.apply(lambda group: group.interpolate(method='ffill'))
    turnstile_resampled['EXITS'] = turnstile_resampled.groupby(['STATION','LINENAME']).EXITS.apply(lambda group: group.interpolate(method='ffill'))
    turnstile_resampled['tot_entries'] = turnstile_resampled.groupby(['STATION','LINENAME','UNIT']).entry_diff.apply(lambda group: group.interpolate(method='bfill'))
    turnstile_resampled['tot_exits'] = turnstile_resampled.groupby(['STATION','LINENAME']).exit_diff.apply(lambda group: group.interpolate(method='bfill'))
    turnstile_resampled = turnstile_resampled[(turnstile_resampled.hour.isin([6,9]))&(turnstile_resampled.entry_diff.isna())&(turnstile_resampled.ENTRIES.notnull())&(turnstile_resampled.tot_entries.notnull())]
    turnstile_resampled = turnstile_resampled.drop(columns=['entry_diff','exit_diff'])
    
    turnstile_resampled['ENTRIES'] = [e + int(t*pct_6) if h == 6 else e + int(t*pct_9) for e,t,h in zip(turnstile_resampled['ENTRIES'],turnstile_resampled['tot_entries'], turnstile_resampled['hour'])]
    turnstile_resampled['EXITS'] = [e + int(t*pct_6) if h == 6 else e + int(t*pct_9) for e,t,h in zip(turnstile_resampled['EXITS'],turnstile_resampled['tot_exits'], turnstile_resampled['hour'])]

    turnstile_data_raw_imputed = pd.concat([turnstile_data_raw,turnstile_resampled.drop(columns=['weekday','hour','tot_entries','tot_exits'])],sort=False)
    turnstile_data_raw_imputed = turnstile_data_raw_imputed.sort_values('datetime')
    return turnstile_data_raw_imputed

def consolidate_turnstile_data(turnstile_data):
    '''
    Consolidates turnstile data across multiple units within a station complex
    '''
    turnstile_data = turnstile_data.reset_index()
    turnstile_data.loc[turnstile_data.estimated_entries < 0, 'estimated_entries'] = 0
    turnstile_data.loc[turnstile_data.estimated_exits < 0, 'estimated_exits'] = 0
    turnstile_data = turnstile_data.groupby(['STATION','LINENAME','datetime']).sum().reset_index()
    turnstile_data['total_entries'] = turnstile_data.groupby(['STATION','LINENAME']).estimated_entries.cumsum()
    turnstile_data['total_exits'] = turnstile_data.groupby(['STATION','LINENAME']).estimated_exits.cumsum()

    stations_with_multiple_line_patterns = ['TIMES SQ-42 ST', '59 ST', '14 ST-UNION SQ', '161/YANKEE STAD', '168 ST', '34 ST-PENN STA', '42 ST-PORT AUTH', '59 ST COLUMBUS', 'ATL AV-BARCLAY', 'BOROUGH HALL', 'FULTON ST']
    line_patterns = ['1237ACENQRSW', 'NQR456W', '456LNQRW', '4BD', '1AC', '123ACE', 'ACENQRS1237W', '1ABCD', '2345BDNQR', '2345R', '2345ACJZ']
    modified_linename = pd.DataFrame({'STATION':stations_with_multiple_line_patterns,'lines':line_patterns})
    
    turnstile_to_consolidate = turnstile_data[(turnstile_data.STATION.isin(stations_with_multiple_line_patterns))]
    turnstile_to_consolidate = turnstile_to_consolidate[~(turnstile_to_consolidate.LINENAME == 'G')]

    turnstile_consolidated = turnstile_to_consolidate.groupby(['datetime','STATION']).sum().reset_index()

    turnstile_consolidated = turnstile_to_consolidate.merge(turnstile_consolidated,how='left',on=['datetime','STATION']).drop(columns=['estimated_entries_x','estimated_exits_x','total_entries_x','total_exits_x']).rename(columns={'estimated_entries_y':'estimated_entries','estimated_exits_y':'estimated_exits','total_entries_y':'total_entries','total_exits_y':'total_exits'})
    turnstile_consolidated = turnstile_consolidated.merge(modified_linename,how='left',on='STATION').rename(columns={'lines':'modified_linename'})
    turnstile_data_cleaned = turnstile_data[~turnstile_data.STATION.isin(stations_with_multiple_line_patterns)].copy()
    fulton_g = turnstile_data[(turnstile_data.STATION == 'FULTON ST')&(turnstile_data.LINENAME == 'G')].copy()
    turnstile_data_cleaned = turnstile_data_cleaned.append(fulton_g,sort=False)
    turnstile_data_cleaned['modified_linename'] = turnstile_data_cleaned.LINENAME
    turnstile_data_cleaned = turnstile_data_cleaned.append(turnstile_consolidated,sort=False)
    
    return turnstile_data_cleaned