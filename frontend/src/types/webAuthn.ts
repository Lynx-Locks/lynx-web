export interface ServerData {
  challenge: string;
  rp: { name: string };
  user: { id: string; name: string; display_name: string };
  pub_key_cred_params: [PublicKeyCredentialParameters];
  authenticator_selection: {
    authenticatorAttachment: AuthenticatorAttachment;
    require_resident_ley: boolean;
  };
}


export interface ResponseCredential {
  id: String;
  type: String;
  authenticator_attachment?: String;
  response?: {
    clientDataJSON: String;
    attestationObject: String;
    transports: String[];
  };
}