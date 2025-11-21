interface IMember {
  memberId: string;
  memberName: string;
  memberNameKana: string;
  mediaId: string;
}
interface IUser {
  id: string;
  email: string;
  member: IMember;
}
 
export type { IUser };
