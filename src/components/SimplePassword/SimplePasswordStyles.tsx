import styled from 'styled-components'

const SimplePasswordContainer=styled.div`
    width:100vw;
    height:100vh;
    background-color:white;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
`

const PasswordInput = styled.input`
    width:40vw;
    padding: 5px 10px;
    box-sizing:border-box;
    margin-bottom: 20px;
    
`

const PasswordSubmit = styled.button`
    width:40vw;
`
export const Styles={
    SimplePasswordContainer,
    PasswordInput,
    PasswordSubmit
}