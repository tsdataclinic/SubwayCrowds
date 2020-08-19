import React from 'react'
import { MetricType } from '../../types'
import {Styles} from './ToggleButtonStyles'


type ToggleButtonProps = {
    set:boolean,
    metric: MetricType,
    onClick:  (event: React.MouseEvent<HTMLButtonElement>) => void;     
}
export const  ToggleButton: React.FC<ToggleButtonProps> = ({set,metric,children, onClick})=>{
    return(
        <Styles.ToggleButton onClick={onClick} set={set}>
            <Styles.ToggleButtonSquare metric={metric} />
            <span>{children}</span>
        </Styles.ToggleButton>
    )
}