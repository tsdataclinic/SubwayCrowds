import styled from "styled-components"


const TopBar = styled.div`
   width:100%;
   height:20px;
   display:flex;
   flex-direction:row;
   justify-content:space-between;
`

const ModalButton = styled.button`
  background:none;
  border:none;
  cursor:pointer;
`

const DataClinicLink = styled.a`
 display:flex;
 color:black;
 text-decoration:none;
 flex-direction:row;
 align-items:center;
 color: #1e4d5e;
`

export const Styles={
    TopBar,
    ModalButton,
    DataClinicLink
} 