import React from 'react'
import styled from 'styled-components'


const Container = styled.ul`
    display:grid;
    grid-template-columns: 1fr 1fr ;
    grid-row-gap:10px;
    grid-column-gap:10px;
    max-height: 50vh;
    overflow-y:auto;
    list-style:none;
    padding:0px;
`
const StopName = styled.li`
    box-sizing:border-box;
    text-align:right;
    
    /* padding: 20px 10px; */
`
type BarProps = {
    percent : number
}

const StopBar = styled.li`
    box-sizing:border-box;
    align-self:start;
    width:${({percent}:BarProps)=> `${percent}%`};
    background-color:red;
    height:100%;
    box-sizing:border-box;
    padding:3px 3px 3px 0px;
    color:white;
    display:flex;
    justify-content:flex-end;
    font-size:0.9rem;
    /* padding: 20px 10px; */
`

const StopCount = styled.li`
    align-self:end;
    text-align:left;
`

export const Styles = {Container, StopName,StopBar, StopCount}