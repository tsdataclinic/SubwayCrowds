import styled from 'styled-components'
import {MetricType} from '../../types'
import {DataTypeColor} from '../../utils'

type ToggleButtonProps = {
    set:boolean
}

type ToggleButtonSquareProps = {
    metric:MetricType
}

const ToggleButtonSquare = styled.span`
    width:45px;
    height:15px;
    border: 2.5px solid;
    border-color: ${({metric}:ToggleButtonSquareProps)=> DataTypeColor(metric,1)};
    display: inline-block;
    margin-right:5px;
    box-sizing:border-box;
`

const ToggleButton = styled.button`
    background-color:none;
    text-decoration:${({set} : ToggleButtonProps) => set ? 'none' : 'line-through'};
    border:none;
    font-size:12px;
    color: grey;
    background-color:white;
    display:flex;
    flex-direction:row;
    align-items:center;
    cursor:pointer;
`


export const Styles={
    ToggleButtonSquare,
    ToggleButton
}