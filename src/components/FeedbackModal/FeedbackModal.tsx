import React from 'react'
import Modal from 'react-modal'
import {Styles} from './FeedbackModalStyles'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes} from '@fortawesome/free-solid-svg-icons'

const customStyles={
    overlay: {zIndex: 1000}
}

Modal.setAppElement('#root')
type FeedbackModalProps = {
    isOpen: boolean,
    onClose: ()=>void
}
export function FeedbackModal({isOpen, onClose}:FeedbackModalProps){

   return(
       <Modal isOpen={isOpen}
        onRequestClose={onClose}
        style={customStyles}
       >
           <Styles.Container>
               <Styles.Header>
                    <h1>Feedback</h1>
                    <Styles.CloseButton onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </Styles.CloseButton>
                </Styles.Header>
                <Styles.Content> 
                    <Styles.Form src='https://forms.gle/NGaRNuJcAtZ59G346'/>
                </Styles.Content>
            </Styles.Container>
       </Modal>
   ) 

}