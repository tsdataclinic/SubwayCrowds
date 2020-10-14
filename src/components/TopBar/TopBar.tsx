import React from 'react'
import {Styles} from './TopBarStyles'
import {TwoSigmaLogo} from '@dataclinic/icons'

type TopBarProps={
    onShowFeedback: ()=>void,
    onShowAbout:()=>void 
}

export function TopBar({onShowFeedback,onShowAbout} : TopBarProps){
    return(
        <Styles.TopBar>
                <Styles.DataClinicLink href='https://twosigma.com/dataclinic'>
                    <img style={{width:"20px", marginRight:'10px'}}src='/DataClinicLogo.png'></img>
                    data clinic
                </Styles.DataClinicLink>
            <div className='links'>
                <span className='feedback'><Styles.ModalButton type={'button'} onClick={onShowFeedback}>Give us feedback</Styles.ModalButton></span>
                <span className='about'><Styles.ModalButton type={'button'} onClick={onShowAbout}>About</Styles.ModalButton></span>
            </div>
        </Styles.TopBar>
    )
} 