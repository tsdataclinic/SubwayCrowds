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

export const Styles={
    CloseButton,
    Container,
    Content,
    Header 
}