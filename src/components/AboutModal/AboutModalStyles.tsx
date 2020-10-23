import styled from 'styled-components'

const CloseButton = styled.div`
    cursor:pointer;
`
const Header = styled.div`
    width:100%;
    display:flex;
    flex-direction:row;
    justify-content:space-between;
`

const Container = styled.div`
    height:100%;
    overflow-y:auto;
    display:flex;
    flex-direction:column;
`

const Content = styled.div`
    flex:1; 
`
const TextColumn=styled.div`
    display:flex;
    flex-direction:column;
    flex:1;
    justify-content:center;
    p{
        color:white!important;
    }
    h2{
        color:white;
        padding-left:0px;
        margin-bottom:0px;
        padding-bottom:0px;
    }
`

export const Styles={
    CloseButton,
    Container,
    Content,
    Header, 
    TextColumn
}