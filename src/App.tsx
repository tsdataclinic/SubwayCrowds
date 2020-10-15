import React, { useState, useEffect, useContext } from "react";
import SentanceDropDown from "./components/SentanceDropDown/SentanceDropDown";
import { DataContext } from "./Contexts/DataContext";
import {
  useMaxCrowdingByHourForTrip,
  useCrowdingDataByStops,
  useAbsoluteMaxForStops,
} from "./Hooks/useCrowdingData";
import { useStationsForLine } from "./Hooks/useStationsForLine";
import { Station, Line } from "./types";
import { useStopsBetween } from "./Hooks/useStopsBetween";
import { StopChartType, StopsChart } from "./components/StopsChart/StopsChart";
import { ShareButtons } from "./components/ShareButtons/ShareButtons";
import { DayOfWeekSelector } from "./components/DayOfWeekSelector/DayOfWeekSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faArrowRight,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { HourlyChart } from "./components/HourlyChart/HourlyChart";
import { TopBar } from "./components/TopBar/TopBar";

import { am_pm_from_24 } from "./utils";
import Slider from "react-input-slider";
import Giticon from "./icons/giticon.png";
import queryString from "query-string";
import Mediumicon from "./icons/mediumicon.png";
import "./App.scss";

import "typeface-lato";
import { SimplePassword } from "./components/SimplePassword/SimplePassword";
import { AboutModal } from "./components/AboutModal/AboutModal";
import { FeedbackModal } from "./components/FeedbackModal/FeedbackModal";

import { DCThemeProvider } from "@dataclinic/theme";
import { Styles } from "./AppSyles";

function App() {
  const [loadedParams, setLoadedParams] = useState(false);
  const [passwordPassed, setPasswordPassed] = useState(false);

  // Modals
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Grab the required data from the data context
  const { stations, lines, dataLoaded, dateRange } = useContext(DataContext);

  // Selection variables from the user or populated from the url params
  const [startStationID, setStartStationID] = useState<any>(null);
  const [endStationID, setEndStationID] = useState<any>(null);
  const [selectedLineID, setSelectedLineID] = useState<string | null>(null);
  const [hour, setSelectedHour] = useState(12);
  const [weekday, setWeekday] = useState(true);

  // Find the instances of the data that we need from the Data Context
  const startStation = stations?.find((s: Station) => s.id === startStationID);
  const endStation = stations?.find((s: Station) => s.id === endStationID);
  const line = lines?.find((l: Line) => l.id === selectedLineID);

  const promptComplete = startStation && endStation && line;

  // This filters down the stations we have by line id. Use for narowing the options for the drop downs
  const filteredStations = useStationsForLine(selectedLineID);

  // Fetches the stops between a start and end station for a particular line
  const { stops, order } = useStopsBetween(
    selectedLineID,
    startStationID,
    endStationID
  );
  const maxHourlyCrowdingData = useMaxCrowdingByHourForTrip(
    stops,
    order,
    weekday
  );
  const crowdingDataByStop = useCrowdingDataByStops(
    stops,
    hour,
    order,
    weekday
  );

  const maxCounts = useAbsoluteMaxForStops(stops);
  // This is used to populate our drop down menu for stations
  const stationOptions: any = filteredStations?.map((station: Station) => ({
    text: station.name,
    key: station.id,
  }));

  // Used to populate the drop down menu for lines
  const lineOptions: any = lines?.map((line: Line) => ({
    key: line.name,
    icon: line.icon,
    text: line.name,
  }));

  // Call to reset the application to the inital state and replace the url params
  const reset = () => {
    setStartStationID(null);
    setEndStationID(null);
    setSelectedLineID(null);
    window.history.replaceState({}, "", `${window.location.origin}`);
  };

  const reverseTrip = () => {
    setStartStationID(endStationID);
    setEndStationID(startStationID);
  };

  // Parses the url params to get the start and end station ids and the line.
  // If it finds them sets the appropriate state. Will not run untill the data
  // is loaded in to prevent a race condition.

  useEffect(() => {
    if (dataLoaded && loadedParams === false) {
      const parsed = queryString.parse(window.location.search);
      const startStation: Station | undefined = stations?.find(
        (s: Station) => s.id === parsed.start_station
      );
      const endStation: Station | undefined = stations?.find(
        (s: Station) => s.id === parsed.end_station
      );
      const line: any = lines?.find((l: Line) => l.name === parsed.line);
      if (startStation && line && endStation) {
        setStartStationID(startStation.id);
        setEndStationID(endStation.id);
        setSelectedLineID(line.id);
      } else {
        reset();
      }
      setLoadedParams(true);
    }
  }, [dataLoaded, loadedParams, stations, lines]);

  // Updates the URL params when a user has selected a start / end / line combo
  useEffect(() => {
    if (promptComplete && loadedParams) {
      const state = {
        line: selectedLineID,
        start_station: startStationID,
        end_station: endStationID,
      };
      const params = queryString.stringify(state);
      window.history.replaceState(
        state,
        "",
        `${window.location.origin}?${params}`
      );
    }
  }, [startStationID, endStationID, selectedLineID, loadedParams]);

  const requirePassword = false;
  if (passwordPassed === false && requirePassword) {
    return (
      <div className="App">
        <SimplePassword onPassed={() => setPasswordPassed(true)} />
      </div>
    );
  }
  return (
    <DCThemeProvider>
      <div className="App">
        <AboutModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
        <div className="app-inner">
          <TopBar
            onShowAbout={() => setShowAboutModal(true)}
            onShowFeedback={() => setShowFeedbackModal(true)}
            startStation={startStation}
            endStation={endStation}
            line={line}
          />
          <div
            className={`header ${promptComplete && "header-prompt-complete"}`}
          >
            <div
              className={`fade-in prompt ${
                promptComplete ? "prompt-complete" : "prompt-incomplete"
              } `}
            >
              <div className="line-specification">
                <span className="hide-small">I take the </span>
                <SentanceDropDown
                  prompt={"select line"}
                  options={lineOptions}
                  selectedID={selectedLineID}
                  onSelected={setSelectedLineID}
                  useIcon={true}
                  active={!promptComplete}
                />
                <span style={{ marginRight: "0.25rem" }}> line. </span>
              </div>
              {selectedLineID && (
                <>
                  <div className="line-select fade-in">
                    <span className="hide-small">I get on at </span>
                    <SentanceDropDown
                      key="start"
                      prompt={"select start station name"}
                      options={stationOptions}
                      selectedID={startStationID}
                      onSelected={setStartStationID}
                      active={!promptComplete}
                    />
                  </div>
                  <div className="line-select fade-in">
                    <span className="hide-small">I get off at </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="show-small"
                    />
                    <SentanceDropDown
                      key="end"
                      prompt={"select end station name"}
                      options={stationOptions}
                      selectedID={endStationID}
                      onSelected={setEndStationID}
                      active={!promptComplete}
                    />
                  </div>
                </>
              )}
            </div>

            {promptComplete && (
              <Styles.ControlBar>
                <Styles.ResetButton onClick={reset}>
                  <FontAwesomeIcon
                    style={{ cursor: "pointer", marginRight: "5px" }}
                    icon={faTimesCircle}
                    aria-label="Reset"
                    color="#27a3aa"
                  />
                  reset
                </Styles.ResetButton>
                |
                <Styles.ResetButton onClick={reverseTrip}>
                  <FontAwesomeIcon
                    style={{ cursor: "pointer", marginRight: "5px" }}
                    icon={faExchangeAlt}
                    aria-label="Reverse Trip"
                    color="#27a3aa"
                  />
                  reverse
                </Styles.ResetButton>
                |
                <DayOfWeekSelector weekday={weekday} onChange={setWeekday} />
              </Styles.ControlBar>
            )}
          </div>
          {promptComplete && (
            <div className="graph">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <HourlyChart
                  hourlyData={maxHourlyCrowdingData}
                  hour={hour}
                ></HourlyChart>
                <div
                  style={{
                    marginTop: "5px",
                    display: "flex",
                    flexDirection: "column",
                    width: "95%",
                    paddingLeft: "70px",
                    height: "50px",
                    boxSizing: "border-box",
                  }}
                >
                  <Slider
                    axis="x"
                    x={hour}
                    onChange={({ x }) => setSelectedHour(x)}
                    xmax={23}
                    xmin={0}
                    xstep={1}
                    styles={{
                      track: {
                        width: "100%",
                      },
                      active: {
                        backgroundColor: "#27a3aa",
                      },
                    }}
                  />

                  <span
                    style={{
                      marginTop: "5px",
                      color: "grey",
                      fontSize: "12px",
                    }}
                  >
                    Use slider to change the start time of the trip
                  </span>
                </div>
              </div>
              <div className="stops-chart-container">
                {crowdingDataByStop && (
                  <>
                    <h2>
                      Estimated average number of people per car on the train
                      after each stop for a trip starting at{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {am_pm_from_24(hour)}
                      </span>
                      .
                    </h2>

                    <StopsChart
                      stops={stops}
                      stopCount={crowdingDataByStop}
                      maxCounts={maxCounts}
                      variant={StopChartType.Discrete}
                    />
                  </>
                )}
              </div>
            </div>
          )}
          <footer>
            <div className="info-share">
              <div className="info">
                <a href="https://github.com/tsdataclinic/MTACrowdingInteractive">
                  <img src={Giticon} height={20} width={20} />
                </a>
                <a href="https://medium.com/dataclinic">
                  <img src={Mediumicon} height={20} width={20} />
                </a>
              </div>

             {promptComplete && ( <div className="date-range-text">
                Estimates are based on data from {dateRange}
              </div>
            )}
              
            {promptComplete && (
              <div className="share-buttons">
                <p className="hide-small">Share this trip</p>
                <ShareButtons
                  startStation={startStation?.id}
                  endStation={endStation?.id}
                  line={line?.id}
                />
              </div>
            )} 
            </div>
            
            <div className="explainer-text">
              This website and its contents, including all data, figures and
              analysis (“Website”), is provided strictly for informational
              purposes. The Website relies upon publicly available data from the
              MTA and on the results of mathematical models designed by the Two
              Sigma Investments, LP acting through the Two Sigma Data Clinic
              (“Data Clinic”). Data Clinic disclaims any and all representations
              and warranties with respect to the Website, including accuracy,
              fitness for use, reliability, and non-infringement.
            </div>
            <div className="disclaimer">
              <a href="https://www.twosigma.com/legal-disclosure/">
                Legal Disclosure
              </a>
              <span>@ 2020 Two Sigma Investments, LP. All rights reserved</span>
              <a href="https://www.twosigma.com/legal-disclosure/privacy-policy/">
                Privacy Policy
              </a>
            </div>
          </footer>
        </div>
      </div>
    </DCThemeProvider>
  );
}

export default App;
