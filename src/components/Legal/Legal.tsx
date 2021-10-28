import React, { useEffect } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Styles } from "./LegalStyles";
import { useMedia } from "use-media";
import * as Fathom from "fathom-client";
import {TermsOfService, Privacy} from '@dataclinic/terms'

Modal.setAppElement("#root");

type LegalProps = {
  isOpen: boolean;
  onClose: () => void;
  content : "legal" | "privacy";
};


export const LegalModal : React.FC<LegalProps>  = ({ isOpen, onClose, content}) =>{
  const smallScreen = useMedia("(max-width: 480px)");
  const contentStyle = smallScreen
    ? {
        overlay: {},
        content: {
          width: "100%",
          left: "0px",
          top: "0px",
          padding: "0px",
          margin: "0px",
        },
      }
    : {
        overlay: {},
        content: {
          maxWidth: "60vw",
          left: "20vw",
          maxHeight: "80vh",
          top: "10vh",
        },
      };

  const customStyles = {
    content: contentStyle.content,
    overlay: { zIndex: 1000, ...contentStyle.overlay },
  };

  useEffect(() => {
    if (isOpen) {
      Fathom.trackPageview({ url: "/feedback" });
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <Styles.Container>
        <Styles.CloseButton onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </Styles.CloseButton>
        <Styles.Content>
          {content === 'privacy' ? <Privacy projectName="mta"/> : <TermsOfService projectName="mta"/>}
        </Styles.Content>
      </Styles.Container>
    </Modal>
  );
}
