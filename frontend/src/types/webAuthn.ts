export interface RegisterRequest {
  challenge: string;
  rp: PublicKeyCredentialRpEntity;
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection: AuthenticatorSelectionCriteria;
  timeout: number;
}

export interface LoginRequest {
  challenge: string;
  allowCredentials: {
    id: string;
    transports: AuthenticatorTransport[];
    type: PublicKeyCredentialType;
  }[];
  timeout: number;
  rpId: string;
  userVerification: UserVerificationRequirement;
}


export interface ResponseCredential {
  id: String;
  rawId: String;
  type: String;
  authenticatorAttachment?: String;
  response?: {
    clientDataJSON: String;
    attestationObject?: String;
    transports?: String[];
    authenticatorData?: String;
    signature?: string;
    userHandle?: string;
  };
  challenge: string;
}
