"use client";
import useCookie from '@/hooks/use-cookie';
import { postRequest } from '@/utils/functions/api-request';
import { IAuthUser } from '@/utils/interfaces/auth/i-auth-user';
import { IResult } from '@/utils/interfaces/i-result';
import Error from 'next/error';
// import { postRequest } from '@/app/utils/api-request';
// import { IAuthUser } from '@/types/i-auth-user';
// import { Session } from 'next-auth';
// import { useSession } from 'next-auth/react';
import React, { useState } from 'react'

const url: string = '/login';
interface ISigninRequest{
  email: string;
  password: string;
}
const Login = () => {
  var initialErrorState: string[] = [];
  const [error, setError] = useState(initialErrorState);
  const token = useCookie().getCookie('token');
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const email = event.target[0].value;
    const password = event.target[1].value;
    const request: ISigninRequest = {
      email: email,
      password: password
    };
    debugger
    const user =  await postRequest<IResult<IAuthUser>>(url, request, token);
    debugger;
    if(user.isSuccess){
      return user;
    }else{
      setError(user.errors);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          required
        />
        <input
          type="password"
          placeholder="Password"
          required
        />
        <button>Login</button>
      </form>
  )
}

export default Login