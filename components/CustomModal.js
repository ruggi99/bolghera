import React from "react";
import { Modal } from "react-bulma-components";

export default function CustomModal(props) {
  return (
    <Modal
      show={props.show}
      onClose={props.onClose}
      showClose={false}
      closeOnBlur={true}
    >
      <Modal.Card>
        <Modal.Card.Header>
          <Modal.Card.Title>{props.title}</Modal.Card.Title>
        </Modal.Card.Header>
        <Modal.Card.Body>{props.children}</Modal.Card.Body>
        <Modal.Card.Footer justifyContent="flex-end">
          {props.buttons}
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
}
