import React, { useEffect } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import {
  AboutPage,
  AboutPageSegment,
  ContributeSection,
  DataClinicSection,
  ProjectInfoSection,
  TextColumn,
} from "@dataclinic/about-page";
import { Header, Body, SubHeader } from "@dataclinic/typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Styles } from "./AboutModalStyles";
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
    ? {}
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
              appDescription="We built subwaycrowds to estimate how crowded your subway trip is likely to be."
              appSubHeading="Plan your commute better"
            >
              <Body>
                As the city continues to adjust to the new normal and people
                begin heading back to work and school, a central question is how
                will this work given NYC commuters reliance on public
                transportation. Is it possible to move so many people while
                maintaining social distancing?
              </Body>
            </ProjectInfoSection>
            <AboutPageSegment color="white">
              <TextColumn>
                <img
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    alignSelf: "center",
                  }}
                  src="/crowding_methodology.png"
                />
              </TextColumn>
              <TextColumn>
                <Body>
                  To help inform this question, subwaycrowds is designed to
                  identify for specific trips when subway cars are likely to be
                  most crowded so that individuals might alter their travel time
                  or route.
                </Body>
              </TextColumn>
            </AboutPageSegment>
            <DataClinicSection />
            <ContributeSection appName="Subway Crowds" />
          </AboutPage>
        </Styles.Content>
      </Styles.Container>
    </Modal>
  );
}
