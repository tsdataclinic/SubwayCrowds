import React from 'react'
import Modal from 'react-modal'
import {AboutPage} from '@dataclinic/about-page'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {Styles} from './AboutModalStyles'

const customStyles={
    overlay: {zIndex: 1000}
}

Modal.setAppElement('#root')
type AboutModalProps = {
    isOpen: boolean,
    onClose: ()=>void
}
export function AboutModal({isOpen, onClose}:AboutModalProps){

   return(
       <Modal isOpen={isOpen}
       onRequestClose={onClose}
       style={customStyles}
       >
           <Styles.Container>
            <Styles.Header>
           <h1>About</h1>
           <Styles.CloseButton onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
            </Styles.CloseButton>
        </Styles.Header>
       <Styles.Content> 
           <AboutPage appName='How busy is my train'></AboutPage>
</Styles.Content>
            </Styles.Container>
       </Modal>
   ) 

}