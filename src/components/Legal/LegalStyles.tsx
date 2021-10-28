import styled from "styled-components";

const CloseButton = styled.div`
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 40px;
  font-size: 30px;
  color: rgb(255, 187, 0);
`;
const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
`;
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  p {
    color: white !important;
  }
  h2 {
    color: white;
    padding-left: 0px;
    margin-bottom: 0px;
    padding-bottom: 0px;
  }
`;
type AboutPageSegmentProps = {
  color?: string;
};

export const AboutPageSegment = styled.div<AboutPageSegmentProps>`
   width:100%;
   box-sizing:border-box;
   display:flex;
   padding:20px;
   flex-direction:column!important;
   justify-content:center;
   background-color: ${({ color }) => color};
   ${Header}{
       color:white;
   }
   ${({ color, theme }) =>
     !color &&
     `
            :nth-child(3n){
                background-color:${theme.colors.reds.light};
            }
            :nth-child(3n+1){
                background-color:${theme.colors.oranges.normal};
            }
            :nth-child(3n+2){
                background-color:${theme.colors.greens.light};
            }
   `}}
   @media ${({ theme }) => theme.devices.tablet}{
       flex-direction:row;
       padding: 87px 60px 40px 60px
    }
`;
export const Styles = {
  CloseButton,
  Container,
  Content,
  Header,
  TextColumn,
};
