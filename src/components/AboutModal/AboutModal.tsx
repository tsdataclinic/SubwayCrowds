import React, { useEffect } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import {
  AboutPage,
  ContributeSection,
  DataClinicSection,
  ProjectInfoSection,
  TextColumn,
} from "@dataclinic/about-page";
import { Header, Body, SubHeader } from "@dataclinic/typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { AboutPageSegment, Styles } from "./AboutModalStyles";
import { useMedia } from "use-media";
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

Modal.setAppElement("#root");

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const BlackTextColumn = styled(TextColumn)`
  p {
    color: black !important;
  }
`;
const BodyBlack = styled.p`
  color: black !important;
  -webkit-font-smoothing: antialiased;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.875rem;
  font-family: "Lato", sans-serif;
  padding: 10px 0px;
`;

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const smallScreen = useMedia("(max-width: 480px)");
  console.log("Small screen is ", smallScreen);
  const contnetStyle = smallScreen
    ? {
      maxWidth: "100vw",
      left: "10vw",
      maxHeight: "80vh",
      top: "10vh",
    }
    : {
        maxWidth: "60vw",
        left: "20vw",
        maxHeight: "80vh",
        top: "10vh",
      };
  const customStyles = {
    content: contnetStyle,
    overlay: { zIndex: 1000 },
  };
  useEffect(() => {
    if (isOpen) {
      Fathom.trackPageview({ url: "/feedback" });
    }
  }, [isOpen]);

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
            <ProjectInfoSection
              appName={"Subway Crowds"}
              appDescription="We built SubwayCrowds to estimate how crowded your subway trip is likely to be."
              appSubHeading="Plan your commute better"
            >
              <Body>
                As the city continues to adjust to the new normal and people
                begin heading back to work and school, a central question is how
                will this work given NYC commuters reliance on public
                transportation. Is it possible to move so many people while
                maintaining social distancing?
              </Body>
              <Body>
                To help inform this question, SubwayCrowds is designed to
                identify for specific trips when subway cars are likely to be
                most crowded so that individuals might alter their travel time
                or route.
              </Body>
            </ProjectInfoSection>
            <AboutPageSegment color="white">
              <h1 style={{color: "#70d6e3", fontWeight: "normal"}}>A multi-step heuristic approach</h1>
              <Body>
                The task of estimating the crowdedness of a train sounds straightforward yet it is anything but, 
                especially given the limitations of publicly available data. The methodology we adopted is our 
                best guess approximation and can be broken down into the four steps below. 
              </Body>
              <img
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  alignSelf: "center",
                }}
                src="/crowding_methodology.svg"
              />
              <Body>
                We've open sourced the methodology and welcome the opportunity to make improvements. To learn more,
                check out our <a href="https://github.com/tsdataclinic/MTACrowdingInteractive">repo</a> for more details and source code.
              </Body>
            </AboutPageSegment>
            <DataClinicSection />
            <ContributeSection appName="SubwayCrowds" />
          </AboutPage>
        </Styles.Content>
      </Styles.Container>
    </Modal>
  );
}
