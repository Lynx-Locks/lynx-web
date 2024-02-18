export interface RegisterRequest {
  challenge: string;
  rp: PublicKeyCredentialRpEntity;
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection: AuthenticatorSelectionCriteria;
  timeout: number;
}


export interface ResponseCredential {
  id: String;
  rawId: String;
  type: String;
  authenticator_attachment?: String;
  response?: {
    clientDataJSON: String;
    attestationObject?: String;
    transports?: String[];
    authenticatorData?: String;
    signature?: string;
    userHandle?: string;
  };
}
