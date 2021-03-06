import React from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { GraphClientContext } from './MSALContext';
import { config } from './config';
import { Client } from '@microsoft/microsoft-graph-client';

import logoSrc from 'url:./icon.svg';
import micSrc from 'url:./mic.svg';


export const Authorization: React.FC<any> = (props) => {
	const [client, setClient] = React.useState<any>(undefined);
	const isAuthenticated = useIsAuthenticated();
	const { instance, accounts } = useMsal();

	const createClient = (authResponse: any) => {
		if (!authResponse.accessToken) return;
		const client = Client.init({
			authProvider: (done) => {
				done(null, authResponse.accessToken);
			}
		});
		setClient(client);
	}

	const acquare = async (account: AccountInfo) => {
		const options = {
			account: account,
			scopes: config.scopes,
			forceRefresh: true,
		};
		const authResponse = await instance.acquireTokenSilent(options).catch(error => {
			if (error instanceof InteractionRequiredAuthError) {
				return instance.acquireTokenRedirect(options);
			}
		});;
		createClient(authResponse);
	}

	React.useEffect(() => {
		if (accounts.length) {
			acquare(accounts[0]);
		}
	}, [ instance ]);

	const handleLogin = async (e: any) => {
		const loginResponse = await instance.loginPopup();
		console.log(loginResponse);
		acquare(loginResponse.account);
	}

	if (!isAuthenticated) {
		return (
			<form className="login-wrapper">
				<span className="login-icon-wrapper">
					<img className="login-icon" src={logoSrc} width={200} />
				</span>
				<div className="login-spacer"></div>
				<button type="button" onClick={handleLogin} className="login-button">
					<img width={26} src={micSrc} />
					Sign in with Microsoft
				</button>
			</form>
		);
	}

	if (!client) {
		return (
			<div className="loading">
				<img src={logoSrc} width={200} />
			</div>
		)
	}

	return (
		<GraphClientContext.Provider value={client}>
			{props.children}
		</GraphClientContext.Provider>
	);
}
