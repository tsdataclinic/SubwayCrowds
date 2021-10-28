import React, { useState, useEffect, useContext } from "react";
import SentanceDropDown from "./components/SentanceDropDown/SentanceDropDown";
import { DataContext } from "./Contexts/DataContext";
import ReactTooltip from "react-tooltip";
import * as Fathom from "fathom-client";
import useMedia from "use-media";
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
import {
  MetricSelector,
  MetricType,
} from "./components/MetricSelector/MetricSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faArrowRight,
  faTimesCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { HourlyChart } from "./components/HourlyChart/HourlyChart";
import { TopBar } from "./components/TopBar/TopBar";

import { am_pm_from_24 } from "./utils";
import Giticon from "./icons/giticon.png";
import queryString from "query-string";
import Mediumicon from "./icons/mediumicon.png";
import "./App.scss";

import "typeface-lato";
import { SimplePassword } from "./components/SimplePassword/SimplePassword";
import { AboutModal } from "./components/AboutModal/AboutModal";
import { LegalModal } from "./components/Legal/Legal";
import { FeedbackModal } from "./components/FeedbackModal/FeedbackModal";
import { HourSlider } from "./components/HourSlider/HourSlider";

import { DCThemeProvider } from "@dataclinic/theme";
import { Styles } from "./AppSyles";

function App() {
  const [loadedParams, setLoadedParams] = useState(false);
  const [passwordPassed, setPasswordPassed] = useState(false);

  // Make sure we are on the right url
  // useEffect(() => {
  //   if (window.location.origin !== "https://subwaycrowds.tsdataclinic.com") {
  //     window.location.href = `https://subwaycrowds.tsdataclinic.com/${window.location.search}`;
  //   }
  // }, []);

  // Track initial visit
  useEffect(() => {
    Fathom.load("PELBVLNP");
    // Fathom.trackPageview();
  }, []);

  // Media queries for custom mobile layout
  const shouldUseTabs = useMedia("(max-width: 480px)");
  const [metric, setMetric] = useState<MetricType>(MetricType.Hour);

  // Modals
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
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

  //Track when we have a valid route.
  useEffect(() => {
    if (promptComplete) {
      Fathom.trackPageview({
        url: `trip/${selectedLineID}/${startStationID}/${endStationID}`,
      });
    }
  }, [promptComplete, selectedLineID, startStationID, endStationID]);

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

  // const requirePassword = !window.location.href.includes("localhost");
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
        <ReactTooltip />

        <AboutModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
        <LegalModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          content="privacy"
        />
        <LegalModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          content="legal"
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
          {shouldUseTabs && promptComplete && (
            <MetricSelector metric={metric} onSetMetric={setMetric} />
          )}
          {promptComplete && (
            <div className="graph">
              {(!shouldUseTabs || metric === MetricType.Hour) && (
                <div
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <>
                    <h2>
                      Average max people per subway car for this trip during the
                      previous two weeks{" "}
                      <a
                        data-tip="This graph shows an estimate of the maximum number of people <br /> 
                        you will likely encounter at any one time in the average subway car <br /> 
                        on this trip for any given hour of the day."
                        data-iscapture="true"
                      >
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="info-button"
                        />
                      </a>
                      <ReactTooltip place={"bottom"} multiline={true} />
                    </h2>
                    <HourlyChart
                      hourlyData={maxHourlyCrowdingData}
                      hour={hour}
                    ></HourlyChart>
                  </>
                  {!shouldUseTabs && (
                    <HourSlider hour={hour} onSetHour={setSelectedHour} />
                  )}
                </div>
              )}
              {(!shouldUseTabs || metric === MetricType.Stops) && (
                <div className="stops-chart-container">
                  {crowdingDataByStop && (
                    <>
                      <h2>
                        Average people per subway car by stop at{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {am_pm_from_24(hour)}
                        </span>{" "}
                        during the previous two weeks{" "}
                        <a
                          data-tip="This graph shows an estimate of the average of the number of people <br />
                           you will likely encounter in the average subway car after each stop <br /> 
                           of this trip starting at the specified hour."
                          data-iscapture="true"
                        >
                          <FontAwesomeIcon
                            className="info-button"
                            icon={faInfoCircle}
                          />
                        </a>
                        <ReactTooltip place={"bottom"} multiline={true} />
                      </h2>
                      {shouldUseTabs && (
                        <HourSlider hour={hour} onSetHour={setSelectedHour} />
                      )}

                      <StopsChart
                        stops={stops}
                        stopCount={crowdingDataByStop}
                        maxCounts={maxCounts}
                        variant={StopChartType.Discrete}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          <footer>
            <div className="info-share">
              <div className="info">
                <a href="https://github.com/tsdataclinic/SubwayCrowds">
                  <img src={Giticon} height={20} width={20} />
                </a>
                <a href="https://medium.com/dataclinic/commuting-during-covid-19-using-open-data-to-predict-nyc-subway-crowds-f1dcabc4fd99">
                  <img src={Mediumicon} height={20} width={20} />
                </a>
              </div>

              {!promptComplete && (
                <div className="date-range-text">
                  {/* Note: Estimates are not available for the L line due to
                  reporting inconsistencies. We hope to be able to add it soon!{" "} */}
                </div>
              )}

              {promptComplete && (
                <div className="date-range-text">
                  Estimates are based on data from {dateRange}{" "}
                  <a
                    data-tip="Estimates are representative of the previous two weeks and are not real-time <br />
                    due to the weekly/bi-weekly publication schedule for the turnstile usage data."
                    data-iscapture="true"
                  >
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="info-button"
                    />
                  </a>
                  <ReactTooltip place={"bottom"} multiline={true} />
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
              MTA and on the results of mathematical models designed by Two
              Sigma Investments, LP acting through Two Sigma Data Clinic (“Data
              Clinic”). Data Clinic disclaims any and all representations and
              warranties with respect to the Website, including accuracy,
              fitness for use, reliability, and non-infringement.
            </div>
            <div className="disclaimer">
              <a
                onClick={() => setShowTermsModal(true)}
                style={{ cursor: "pointer" }}
              >
                Legal Disclosure
              </a>
              <span>@ 2020 Two Sigma Investments, LP. All rights reserved</span>
              <a
                onClick={() => setShowPrivacyModal(true)}
                style={{ cursor: "pointer" }}
              >
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
