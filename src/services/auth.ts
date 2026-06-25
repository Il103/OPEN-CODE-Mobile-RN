import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

export const AuthService = {
  async signInWithGoogle(): Promise<UserProfile> {
    await GoogleSignin.hasPlayServices();
    const { data } = await GoogleSignin.signIn();
    const credential = auth.GoogleAuthProvider.credential(data.idToken);
    const result = await auth().signInWithCredential(credential);
    return {
      uid: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
    };
  },

  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const result = await auth().signInWithEmailAndPassword(email, password);
    return {
      uid: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
    };
  },

  async signUp(email: string, password: string, name: string): Promise<UserProfile> {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: name });
    return {
      uid: result.user.uid,
      name,
      email: result.user.email,
      photoURL: null,
    };
  },

  async signOut(): Promise<void> {
    await GoogleSignin.signOut();
    await auth().signOut();
  },

  onAuthChanged(callback: (user: UserProfile | null) => void): () => void {
    return auth().onAuthStateChanged((user) => {
      if (user) {
        callback({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      } else {
        callback(null);
      }
    });
  },
};
