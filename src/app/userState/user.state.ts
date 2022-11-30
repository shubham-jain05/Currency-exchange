import { State, Action, StateContext, Selector } from '@ngxs/store';
import { AddcurrencyHistory } from '../userState/user.action';

export class UserStateModel {
  users: any;
}

@State<UserStateModel>({
  name: 'users',
  defaults: {
    users: []
  }
})
export class UserState {

  @Selector()
  static getUsers(state: UserStateModel) {
    return state.users;
  }

  @Action(AddcurrencyHistory)
  add({ getState, patchState }: StateContext<UserStateModel>, { payload }: AddcurrencyHistory) {
    const state = getState();
    patchState({
      users: [...state.users, payload]
    });
  }
}