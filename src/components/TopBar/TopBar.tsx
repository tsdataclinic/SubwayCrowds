import React from 'react'
import {Styles} from './TopBarStyles'

export function TopBar(){
    return(
        <Styles.TopBar>
            <span className='dataclinic'>Created by <a href='https://twosigma.com/dataclinic'>Data Clinic</a></span>
            <span className='feedback'><a target="_blank" href='https://docs.google.com/forms/d/1ARv7VDTNcBaBGKkSkCU4-wiN5TGJVMu7tXzP-mi5EQ8/edit'>Give us feedback</a></span>
        </Styles.TopBar>
    )
} 