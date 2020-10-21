import React from "react";
import Modal from "react-modal";
import { AboutPage, AboutPageSegment } from "@dataclinic/about-page";
import { Header, Body, SubHeader } from "@dataclinic/typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Styles } from "./AboutModalStyles";
import * as Fathom from "fathom-client";

const customStyles = {
  content: {
    maxWidth: "60vw",
    left: "20vw",
    maxHeight: "80vh",
    top: "10vh",
  },
  overlay: { zIndex: 1000 },
};
j;
Modal.setAppElement("#root");

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <Styles.Container>
        <Styles.Header>
          <h1></h1>
          <Styles.CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </Styles.CloseButton>
        </Styles.Header>
        <Styles.Content>
          <AboutPage>
            <AboutPageSegment>
              <Header>How busy is my train</Header>
              <Body>
                As the city continues to reopen, more people are heading back
                into work and students are attending colleges or schools
                in-person. A central question on many minds is how exactly this
                will all work given NYC commuters reliance on public
                transportation. Is it possible to safely and effectively move so
                many people while maintaining social distancing?
              </Body>
              <Body>
                To answer this question, we envisioned an app that provides the
                city and commuters some way of understanding how crowded their
                route might be from the perspective of an average subway car.
                The goal is to identify when train cars in a specific route are
                most crowded so that individuals might alter their travel time
                or specific trip if possible.
              </Body>

              <Header>Methodology</Header>
              <Body>
                Estimating crowdedness of subway cars relies on data made public
                by the MTA, such as the turnstile usage data, and General
                Transit Feed Specification (GTFS) data. The methodology we
                adopted is our best guess approximation and can be broken down
                into four steps as illustrated below.
              </Body>

              <SubHeader>Train schedules</SubHeader>

              <Body>
                Process realtime GTFS data to get the trips taken by each train
                everyday
              </Body>

              <SubHeader>Commuters</SubHeader>

              <Body>
                Clean and interpolate Turnstile usage data to get a sense of
                number of people at each station at every minute
              </Body>

              <SubHeader>Trip assignment</SubHeader>

              <Body>
                Apply heuristics to assign people waiting at the station across
                different lines and directions
              </Body>

              <SubHeader>Crowding Estimation</SubHeader>
              <Body>
                Add people waiting at a station to the trip, subtract exits at
                the station from the trip to estimate crowdedness
              </Body>
            </AboutPageSegment>
          </AboutPage>
        </Styles.Content>
      </Styles.Container>
    </Modal>
  );
}
