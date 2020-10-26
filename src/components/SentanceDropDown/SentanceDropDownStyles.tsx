import styled from "styled-components";

const Container = styled.div`
  display: inline;
  position: relative;
  min-width: 50px;
  padding: 0px 5px;
`;

const Input = styled.input`
  border: none;
  box-shadow: none;
  text-align: center;
  border-bottom: 1px solid grey;
`;
const Icon = styled.img`
  width: 30px;
`;
const DropDownList = styled.ul`
  list-style: none;
  margin: 0px;
  padding: 10px 20px;
  box-sizing: border-box;
  background-color: white;
  box-shadow: -1px 2px 5px 0px rgba(0, 0, 0, 0.75);
  overflow-y: auto;
  max-height: 30vh;
  position: absolute;
  top: 125%;
  left: 0px;
  width: 100%;
  border-radius: 5px;
  z-index: 1000;
`;

const DropDownListEntry = styled.li`
  border-bottom: 1 px solid grey;
  display: flex;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  padding: 10px;
  &:hover {
    background-color: #f0f0f0;
  }
`;

export default {
  Container,
  Input,
  DropDownList,
  DropDownListEntry,
  Icon,
};
