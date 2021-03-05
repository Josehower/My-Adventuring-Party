import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Div = styled.div`
  color: transparent;
`;

const endTimeQuery = gql`
  query expeditionEndTime($heldenId: Int!) {
    expeditionEndTime(heldenId: $heldenId)
  }
`;

const Timer = (props) => {
  const { data, loading, error, refetch } = useQuery(endTimeQuery, {
    variables: {
      heldenId: props.heldenId,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  });

  const [timeLeft, setTimeLeft] = useState();

  useEffect(() => {
 
    const interval = setInterval(()=>{ 
      if(loading) return
      if(timeLeft <= 0){
        refetch();
        return
      }
      const now = +Date.now();
        setTimeLeft(Number(data?.expeditionEndTime) - now)
      },100 )
  return ()=>clearInterval(interval)
  }, [data]);


  if (loading || !timeLeft ){return (
    <Div className={props.className}>
     00:00
    </Div>
  )}


  if (error) return `${error}`;

  const daysUntilEnd = Math.floor(timeLeft / 1000 / 60 / 60 / 24);
  const hoursUntilEnd =
    Math.floor(timeLeft / 1000 / 60 / 60) - daysUntilEnd * 24;
  const minutesUntilEnd =
    Math.floor(timeLeft / 1000 / 60) -
    hoursUntilEnd * 60 -
    daysUntilEnd * 24 * 60;
  const secondsUntilEnd =
    Math.floor(timeLeft / 1000) -
    minutesUntilEnd * 60 -
    hoursUntilEnd * 60 * 60 -
    daysUntilEnd * 24 * 60 * 60;



if (timeLeft < 800) {
  props.refetcher()
  return (
    <div className={props.className}>
      BACK
    </div>)
}

  return (
    <div className={props.className}>
   {daysUntilEnd ? daysUntilEnd+":" : "" }
   {hoursUntilEnd ? hoursUntilEnd+":" : ""}
   {minutesUntilEnd ? minutesUntilEnd < 10? "0"+minutesUntilEnd+":" : minutesUntilEnd+":" : "00:"}
   {secondsUntilEnd < 10 ? "0"+secondsUntilEnd : secondsUntilEnd}
    </div>
  );
};

export default Timer;
