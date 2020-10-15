import styled from 'styled-components'

const Container =styled.div`
    display:flex;
    flex-direction:row;
    justify-content:space-around;
    align-items:center;
    margin:5px 0px;
    box-sizing:border-box;
    padding:10px 0px;
    color:#27a3aa;
    font-weight:bold;
    @media only screen and (min-width:900px){
        margin: 1px 0px;
    }
`

const Option = styled.div`
    box-sizing:border-box;
    padding:10px 0px;
    :first-child{
        margin-right:10px;
    }
    cursor:pointer;
`
const Divider = styled.span`

`

export const Styles={
    Container,
    Option,
    Divider

}
