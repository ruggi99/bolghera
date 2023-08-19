import { Modal } from "react-bulma-components";

export default function CustomModal({
  buttons,
  children,
  onClose,
  show,
  title,
}) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      showClose={false}
      closeOnBlur={true}
      onEnter={() => console.log("enter")}
      className="px-3"
    >
      <Modal.Card>
        <Modal.Card.Header>
          <Modal.Card.Title>{title}</Modal.Card.Title>
        </Modal.Card.Header>
        <Modal.Card.Body>{children}</Modal.Card.Body>
        <Modal.Card.Footer justifyContent="flex-end">
          {buttons}
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
}
