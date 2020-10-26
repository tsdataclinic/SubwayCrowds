import React, { useEffect } from "react";
import Modal from "react-modal";
import { Styles } from "./FeedbackModalStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useMedia } from "use-media";
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

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <Styles.Container>
        <Styles.CloseButton onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </Styles.CloseButton>
        <Styles.Content>
          <Styles.Form src="https://forms.gle/TxjaHpbibEbPMkDj9" />
        </Styles.Content>
      </Styles.Container>
    </Modal>
  );
}
