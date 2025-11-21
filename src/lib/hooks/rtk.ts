// import { loading } from '@/core/ui/UILoading';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type QueryHook<TArgs extends any[] = any[], TResult = { isFetching: boolean }> = (
  ...args: TArgs
) => TResult;

type MutationResult = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  originalArgs?: any;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data?: any;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  error?: any;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type MutationHook<Args extends any[] = any[], Result extends MutationResult = MutationResult> = (
  ...args: Args
) => readonly [
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  (...args: any[]) => Promise<any>,
  Result
];


function useQueryWithGlobalLoading<QH extends QueryHook>(
  queryHook: QH,
  ...args: Parameters<QH>
): ReturnType<QH> {
  const result = queryHook(...args);
  const { isFetching } = result;

  // useEffect(() => {
  //   if (isFetching) loading.show();
  //   else loading.hide();
  // }, [isFetching]);

  return result as ReturnType<QH>;
}

function useMutationWithGlobalLoading<MH extends MutationHook>(
  mutationHook: MH,
  ...args: Parameters<MH>
): ReturnType<MH> {
  const [mutate, result] = mutationHook(...args);

  // useEffect(() => {
  //   if (result.isLoading) loading.show();
  //   else loading.hide();
  // }, [result.isLoading]);

  return [mutate, result] as ReturnType<MH>;
}
export { useMutationWithGlobalLoading, useQueryWithGlobalLoading };

