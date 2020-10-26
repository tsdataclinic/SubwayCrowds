import styled, {css, keyframes} from 'styled-components'
import {DataTypeColor} from '../../utils'
import {MetricType} from '../../types'

const MIN_PC_INSIDE = 10

const Container = styled.div`
    display:flex;
    flex-direction:column;
    flex:1;
    @media only screen and (min-width:900px){
      
      /* max-height: 400px; */
    }
`
const BarsContainer = styled.ul`
    display:grid;
    grid-template-columns: 0.6fr 1fr ;
    grid-template-rows: repeat(auto-fill, 30px);
    grid-column-gap:20px;
    max-height: 50vh;
    overflow-y:auto;
    list-style:none;
    padding:0px 0px;
    box-sizing:border-box;
    flex:1;
    height:100%;
    align-items:center;
    margin-top:15px;
    @media only screen and (min-width:900px){
        margin-top:10px;
      }
`

const StopName = styled.li`
    box-sizing:border-box;
    text-align:right;
    display:flex;
    flex-direction:column;
    height:30px;
    /* margin-bottom: 10px; */
    border-right : 2px solid black;
    padding: 0px 10px 0px 10px;
    position:relative;
    justify-content:center;
    color: grey;
    font-weight:bold;
    font-size:13px;
    @media only screen and (min-width:900px){
        font-size:16px;
      }
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
        position:absolute;
        top:9px;
        right:-8px;
        z-index:100;
    }
`

type BarProps = {
    percent : number,
    metric: MetricType,
}

const StopBars = styled.li`
    display:flex;
    flex-direction:column;

`
const Metric = styled.div`
    display:flex;
    flex-direction:row;
    /* justify-content:space-between; */
    align-items:center;
    font-size:13px;
    color: grey;
    box-sizing: border-box;
    padding: 8px 0px;

`


const typeSizes={
    [MetricType.CURRENT] : '20px',
    [MetricType.MONTH] : '2px',
    [MetricType.YEAR] : '2px'
}

const StopBar = styled.span`
    box-sizing:border-box;
    align-self:start;
    width:${({percent}:BarProps)=> `${percent}%`};
    background-color:${({metric}:BarProps)=> DataTypeColor(metric,1)};
    height: ${({metric}:BarProps)=> `${typeSizes[metric]}`};
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
`

const StopSquares = styled.div`
    display:flex;
    flex-direction:row;
    width:100%;
    align-items:center;
    span{
        font-size: 10px;
        margin-left:5px;
        @media only screen and (min-width:900px){
            margin-left: 10px;
        }
    }

`

type SquareProps = {
    color: string
    order: number
}

const popIn = keyframes`
    from {
        transform: scale(0);
    }
    to {
        transform: scale(1);
    }
`

const StopSquare = styled.div`
    width: 10px;
    height:10px;
    background-color:${(props:SquareProps)=> {return props.color}};
    border:1px solid grey; 
    margin-right:2px;
    animation : ${popIn} .2s;

`


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
    StopSquare,
    StopSquares,
    StopBars,
    Metric
}