import { createContext, FunctionComponent, useContext, useEffect, useState } from 'react';
import { Contest } from '../interface/Contest';
import { useAuth } from './useAuthContext';
import { fetchAllContestByUserId } from '../helpers/APICalls/searchContest';
interface IContestContext {
  readonly allContests: Contest[];
}

export const ContestContext = createContext<IContestContext>({
  allContests: [],
});
export const ContestProvider: FunctionComponent = ({ children }): JSX.Element => {
  const { loggedInUser } = useAuth();
  // get all contests and submission by userID
  useEffect(() => {
    if (loggedInUser) {
      const getAllContestByUserId = async () => {
        const contests = await fetchAllContestByUserId({ userId: loggedInUser.id });
        console.log(contests);
        setAllContext(contests.contests);
      };
      getAllContestByUserId();
    }
  }, [loggedInUser]);
  const [allContests, setAllContext] = useState<Contest[]>();
  return <ContestContext.Provider value={{ allContests: allContests || [] }}>{children}</ContestContext.Provider>;
};
export function useContests(): IContestContext {
  return useContext(ContestContext);
}