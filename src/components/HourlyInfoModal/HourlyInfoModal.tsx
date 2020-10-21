import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Styles } from "./HourlyInfoModalStyles";

const customStyles = {
  overlay: { zIndex: 1000 },
};

Modal.setAppElement("#root");
type HourlyInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
export function HourlyInfoModal({ isOpen, onClose }: HourlyInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <Styles.Container>
        <Styles.Header>
          <h1>Average max ridership per trip</h1>
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
