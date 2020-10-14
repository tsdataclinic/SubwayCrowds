import React from 'react'
import {Styles} from './TopBarStyles'
import {TwoSigmaLogo} from '@dataclinic/icons'
import { Station, Line} from '../../types'
import {ShareButtons} from '../ShareButtons/ShareButtons'

type TopBarProps={
    onShowFeedback: ()=>void,
    onShowAbout:()=>void, 
    startStation?:Station,
    endStation?:Station,
    line?: Line
}

export function TopBar({onShowFeedback,onShowAbout, startStation, endStation,line} : TopBarProps){
    return(
        <Styles.TopBar>
                <Styles.DataClinicLink href='https://twosigma.com/dataclinic'>
                    <img style={{width:"20px", marginRight:'10px'}}src='/DataClinicLogo.png'></img>
                    data clinic
                </Styles.DataClinicLink>
            <Styles.Links>
                <span className='feedback'><Styles.ModalButton type={'button'} onClick={onShowFeedback}>Give us feedback</Styles.ModalButton></span>
                <span className='about'><Styles.ModalButton type={'button'} onClick={onShowAbout}>About</Styles.ModalButton></span>
                  <ShareButtons
                    startStation={startStation?.id}
                    endStation={endStation?.id}
                    line={line?.id}
                  />
            </Styles.Links>
        </Styles.TopBar>
    )
} 