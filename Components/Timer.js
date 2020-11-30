import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

const timeLeftQuery = gql`
  query expeditionTimeLeft($heldenId: Int!) {
    expeditionTimeLeft(heldenId: $heldenId)
  }
`;

const Timer = (props) => {
  const { data, loading, error } = useQuery(timeLeftQuery, {
    variables: {
      heldenId: props.heldenId,
    },
  });
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft === 0 && data) {
      setTimeLeft(parseInt(data?.expeditionTimeLeft));
    }
    const timer = setInterval(() => {
      const counter = timeLeft - 1000;
      if (counter <= 0) {
        props.refetcher();
        return;
      }
      setTimeLeft(timeLeft - 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, [data, timeLeft]);

  if (loading) return <p>loading...</p>;
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

  return (
    <div className={props.className}>
      {daysUntilEnd}:{hoursUntilEnd}:{minutesUntilEnd}:{secondsUntilEnd}
    </div>
  );
};

export default Timer;
