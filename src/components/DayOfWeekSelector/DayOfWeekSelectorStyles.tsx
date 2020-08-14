import styled from 'styled-components'

const Container =styled.div`
    display:flex;
    flex-direction:row;
    justify-content:space-around;
    margin:5px 0px;
    @media only screen and (min-width:900px){
        margin: 20px 10px;
    }
`

const Option = styled.div`
    box-sizing:border-box;
    padding:10px 20px;
    border: 1px solid grey;
    cursor:pointer;
`

export const Styles={
    Container,
    Option

}