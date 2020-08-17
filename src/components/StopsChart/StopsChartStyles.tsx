import styled, {css} from 'styled-components'
import {DataTypeColor} from '../../utils'


const MIN_PC_INSIDE = 10

const Container = styled.div`
    display:flex;
    flex-direction:column;
    flex:1;
`
const BarsContainer = styled.ul`
    display:grid;
    grid-template-columns: 0.6fr 1fr ;
    grid-column-gap:20px;
    max-height: 50vh;
    overflow-y:auto;
    list-style:none;
    padding:15px 0px;
    box-sizing:border-box;
    flex:1;
    height:100%;
    align-items:center;
`
type MetricToggleProps={
    set:boolean
}


const MetricToggle = styled.button`
    color:${({set} : MetricToggleProps) => set ? 'red' : 'blue'};
`
const StopName = styled.li`
    box-sizing:border-box;
    text-align:right;
    
    /* margin-bottom: 10px; */
    border-right : 2px solid black;
    padding: 20px 10px;
    span{
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    ::after{
        content: '';
        background-color:white;
        width:10px;
        height:10px;
        border-radius: 10px;
        border:2px solid black;
        display: inline-block;
        transform:translate3d(130%,5%,0px);
        z-index:100;
    }
    :first-child
`
type BarProps = {
    percent : number,
    type: 'current' | 'month' | 'year',
}

const StopBars = styled.li`
    display:flex;
    flex-direction:column;

`
const Metric = styled.div`
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    align-items:center;
   
`

const MetricButton = styled.button`
    button{
        border:none;
        background-color:transparent;
    }
`
const typeSizes={
    'current': '20px',
    'month': '2px',
    'year' : '2px'
}

const typeColors={
    'current': 'rgba(112,214,227,1)',
    'month': 'rgba(255,0,0,1)',
    'year' : 'rgba(0,255,0,1)'
}
const StopBar = styled.span`
    box-sizing:border-box;
    align-self:start;
    width:${({percent}:BarProps)=> `${percent}%`};
    background-color:${({type}:BarProps)=> DataTypeColor(type,1)};
    height: ${({type}:BarProps)=> `${typeSizes[type]}`};
    box-sizing:border-box;
    padding:3px 3px 3px 0px;
    color:white;
    display:flex;
    justify-content:flex-end;
    font-size:0.9rem;
    transition: width 0.5s ease-in-out;
    align-items:center;
    span{
        font-weight:bold;
        min-width:12px;
        transform: ${({percent}:BarProps)=> percent < MIN_PC_INSIDE ? 'translate(140%,0%)' : '' }};
        color:${ ({percent}:BarProps)=> percent < MIN_PC_INSIDE ? 'black' : 'white' };
    }
s`

const StopCount = styled.li`
    align-self:end;
    text-align:left;
`

export const Styles = {
    Container, 
    BarsContainer, 
    StopName,
    StopBar, 
    StopCount, 
    StopBars, 
    Metric,
    MetricButton,
    MetricToggle
}