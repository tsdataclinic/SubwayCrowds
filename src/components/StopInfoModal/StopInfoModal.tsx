import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Styles } from "./StopInfoModalStyles";

const customStyles = {
  overlay: { zIndex: 1000 },
};

Modal.setAppElement("#root");
type HourlyInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function StopInfoModal({ isOpen, onClose }: HourlyInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <Styles.Container>
        <Styles.Header>
          <h1>Number of people per subway train after stop</h1>
          <Styles.CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </Styles.CloseButton>
        </Styles.Header>
        <Styles.Content>
          <p>How is this calculated? ....</p>
        </Styles.Content>
      </Styles.Container>
    </Modal>
  );
}
