import React from 'react'
import {Styles} from './TopBarStyles'

export function TopBar(){
    return(
        <Styles.TopBar>
            <span className='dataclinic'>Created by <a href='https://twosigma.com/dataclinic'>Data Clinic</a></span>
            <span className='feedback'><a target="_blank" href='https://forms.gle/NGaRNuJcAtZ59G346'>Give us feedback</a></span>

        </Styles.TopBar>
    )
} 