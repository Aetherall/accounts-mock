
export default class AccountsClient{
  
	impersonate = () => {
		if (!isString(username)) throw new Error('Username is required')

		if (this.isImpersonated()) throw new Error('User already impersonating')
		
    const { accessToken, refreshToken } = await this.tokens();

    if (!accessToken) throw new AccountsError('There is no access tokens available')

		const res = await this.transport.impersonate(accessToken, username);
		
		if (!res.authorized) throw new AccountsError(`User unauthorized to impersonate ${username}`);

		const { persistImpersonation } = this.options;
    this.store.dispatch(setImpersonated(true));
    this.store.dispatch(setOriginalTokens({ accessToken, refreshToken }));

    if (persistImpersonation) {
      await this.storeOriginalTokens({ accessToken, refreshToken });
      await this.storeTokens(res.tokens);
    }

    this.store.dispatch(setTokens(res.tokens));
    this.store.dispatch(setUser(res.user));
    return res;
  }
	
	stopImpersonation = () => {
		if (this.isImpersonated()) {
      this.store.dispatch(setTokens(this.originalTokens()));
      this.store.dispatch(clearOriginalTokens());
      this.store.dispatch(setImpersonated(false));
      await this.refreshSession();
    }
	}

	isImpersonated = () => this.getState().get('isImpersonated');

	resumeSession = () => {
		await this.refreshSession();
		if ( this.options.onResumedSessionHook && isFunction(this.options.onResumedSessionHook)) {
			this.options.onResumedSessionHook();
		}
	}

	refreshSession = () => {
		const { accessToken, refreshToken } = await this.tokens();		
    if (accessToken && refreshToken) {
      try {
        this.store.dispatch(loggingIn(true));
        const decodedRefreshToken = jwtDecode(refreshToken);
        const currentTime = Date.now() / 1000;
        // Refresh token is expired, user must sign back in
        if (decodedRefreshToken.exp < currentTime) {
          this.clearTokens();
          this.clearUser();
        } else {
          // Request a new token pair
          const refreshedSession: LoginReturnType = await this.transport.refreshTokens(
            accessToken,
            refreshToken
          );
          this.store.dispatch(loggingIn(false));

          await this.storeTokens(refreshedSession.tokens);
          this.store.dispatch(setTokens(refreshedSession.tokens));
          this.store.dispatch(setUser(refreshedSession.user));
        }
      } catch (err) {
        this.store.dispatch(loggingIn(false));
        this.clearTokens();
        this.clearUser();
        throw new AccountsError('falsy token provided');
      }
    } else {
      this.clearTokens();
      this.clearUser();
      throw new AccountsError('no tokens provided');
    }

	}

	createUser = () => {
    if (!user) {
      throw new AccountsError(
        'Unrecognized options for create user request',
        {
          username: user && user.username,
          email: user && user.email,
        },
        400
      );
		}
	}

	loggingIn = () => 

	isLoading = () => 

	logout = () =>

	loginWithPassword = () =>

	verifyEmail = () =>

	resetPassword = () =>
	
	requestPasswordReset =() =>

}