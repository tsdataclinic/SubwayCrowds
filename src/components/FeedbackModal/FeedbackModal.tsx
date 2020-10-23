import React, { useEffect } from "react";
import Modal from "react-modal";
import { Styles } from "./FeedbackModalStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {useMedia} from 'use-media'
import * as Fathom from "fathom-client";

const customStyles = {
  overlay: { zIndex: 1000 },
  content: {
    maxWidth: "60vw",
    left: "20vw",
    maxHeight: "80vh",
    top: "10vh",
  },
};

Modal.setAppElement("#root");
type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  useEffect(() => {
    if (isOpen) {
      Fathom.trackPageview({ url: "/feedback" });
    }
  }, [isOpen]);

  const smallScreen = useMedia("(max-width: 480px)");
  const contentStyle = smallScreen ? {
    maxWidth: "100vw",
    left: "10vw",
    maxHeight: "80vh",
    top: "10vh",
} : 
     {
        maxWidth: "60vw",
        left: "20vw",
        maxHeight: "80vh",
        top: "10vh",
    }
    const customStyles = {
        content: contentStyle,
        overlay: { zIndex: 1000 },
    };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <Styles.Container>
        <Styles.Header>
          <h1>Feedback</h1>
          <Styles.CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </Styles.CloseButton>
        </Styles.Header>
        <Styles.Content>
          <Styles.Form src="https://forms.gle/T4wFtPcNgd8DhFBc7" />
        </Styles.Content>
      </Styles.Container>
    </Modal>
  );
}
