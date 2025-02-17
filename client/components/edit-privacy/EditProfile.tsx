import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { isLoginAtom } from '../../atoms/loginAtom';
import { renderingAtom } from '../../atoms/renderingAtom';
import { dataHeaderAtom } from '../../atoms/userAtom';

import { userDashboard } from '../../interfaces';
import { client } from '../../libs/client';
import { inspectNicknameDuplication } from '../../libs/inspectNicknameDuplication';

interface IChangePassword {
  originalPassword: string;
  newPassword: string;
  newPasswordCheck: string;
}

export const EditProfileComponent = () => {
  const setDataHeader = useSetRecoilState(dataHeaderAtom);
  const setRenderingHeader = useSetRecoilState(renderingAtom);
  const setIsLogin = useSetRecoilState(isLoginAtom);
  const [pathname, setPathname] = useState('');
  const [userId, setUserId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [userData, setUserData] = useState<userDashboard>();
  const [nickname, setNickname] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [github, setGithub] = useState('');
  const [blog, setBlog] = useState('');
  const [jobType, setJobType] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IChangePassword>();
  const onValid: SubmitHandler<IChangePassword> = async ({
    originalPassword,
    newPassword,
    newPasswordCheck,
  }) => {
    if (newPassword !== newPasswordCheck) {
      setError(
        'newPasswordCheck',
        { message: '비밀번호가 맞지 않습니다.' },
        { shouldFocus: true },
      );
    } else {
      if (confirm('비밀번호 변경 하시겠습니가?')) {
        try {
          await client.patch('/api/auth/password', {
            originalPassword,
            newPassword,
          });
          alert('비밀번호가 정상적으로 변경 되었습니다');
          router.push('/');
        } catch (error) {
          alert(`에러 발생 : ${error}`);
        }
      }
    }
  };
  const getPathname = () => {
    setPathname(router.pathname);
  };
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('userId');
      data && setUserId(data);
    }
  };
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('accessToken');
      data && setAccessToken(data);
    }
  };
  const getUserData = async () => {
    if (userId) {
      const res = await client.get(`/api/users/${userId}/dashboard`);
      setUserData(res.data);
    }
  };
  useEffect(() => {
    getPathname();
    getUserId();
    getAccessToken();
  }, []);
  useEffect(() => {
    getUserData();
  }, [userId]);
  useEffect(() => {
    userData?.nickname && setNickname(userData.nickname);
    userData?.infoMessage && setInfoMessage(userData.infoMessage);
    userData?.github && setGithub(userData.github);
    userData?.blog && setBlog(userData.blog);
    userData?.jobType && setJobType(userData.jobType);
  }, [userData]);
  const onSubmitEditProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reg = new RegExp('^(?=.*[a-z0-9가-힣])[a-z0-9가-힣].{0,6}$');
    if (!reg.test(nickname)) {
      alert('닉네임은 최소 1글자, 최대 7글자, 자음, 모음 불가입니다');
    } else {
      if (confirm('프로필 저장 하시겠습니까?')) {
        try {
          await client.patch('/api/users/profiles', {
            nickname,
            infoMessage,
            github,
            blog,
            jobType,
          });
          localStorage.setItem('nickname', nickname);
          setRenderingHeader((prev) => !prev);
          router.push('/');
        } catch (error) {
          alert(`에러 발생 : ${error}`);
        }
      }
    }
  };
  const onSubmitMembershipWithdrawal = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const ok = confirm('회원 탈퇴 하시겠습니까?');
    if (ok) {
      try {
        await client.delete('/api/auth', {
          data: {
            password,
          },
        });
        alert('회원 탈퇴 완료되었습니다');
        localStorage.clear();
        setDataHeader(null);
        setIsLogin(false);
        router.push('/');
      } catch (error) {
        alert(`에러 발생 : ${error}`);
      }
    }
  };

  const onBlurNickname = () => {
    inspectNicknameDuplication(userData?.nickname ?? '', nickname);
  };
  return (
    <>
      {pathname === '/edit-profile' ? (
        <>
          <div className="mb-16">
            <span className="text-3xl font-bold">프로필 수정</span>
          </div>
          <form onSubmit={onSubmitEditProfile}>
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              className="w-full rounded-full h-11 px-4 mt-2 mb-10 border border-main-gray"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={onBlurNickname}
            />
            <label htmlFor="message">메세지</label>
            <input
              id="message"
              type="text"
              placeholder="메세지를 입력해주세요"
              className="w-full rounded-full h-11 px-4 mt-2 mb-10 border border-main-gray"
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
            />
            <label htmlFor="github">깃허브 주소</label>
            <input
              id="github"
              type="text"
              placeholder="깃허브 주소를 입력해주세요"
              className="w-full rounded-full h-11 px-4 mt-2 mb-10 border border-main-gray"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            <label htmlFor="blog">블로그 주소</label>
            <input
              id="blog"
              type="text"
              placeholder="블로그 주소를 입력해주세요"
              className="w-full rounded-full h-11 px-4 mt-2 mb-10 border border-main-gray"
              value={blog}
              onChange={(e) => setBlog(e.target.value)}
            />
            <label htmlFor="userState">직업 현황</label>
            <select
              id="userState"
              className="w-full rounded-full h-11 px-4 mt-2 mb-32 border border-main-gray"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="JOB_SEEKER">개발자 취준생</option>
              <option value="DEVELOPER">현업 개발자</option>
              <option value="DESIGNER">디자이너</option>
              <option value="PM">프로덕트 매니저</option>
              <option value="NON_NORMAL">비개발 직군</option>
            </select>
            <div className="flex gap-8">
              <button className="w-full py-[6px] rounded-full bg-main-yellow">
                저장
              </button>
              <Link href="/">
                <div className="w-full py-[6px] rounded-full bg-main-gray hover:cursor-pointer flex justify-center">
                  <span>취소</span>
                </div>
              </Link>
            </div>
          </form>
        </>
      ) : pathname === '/edit-password' ? (
        <>
          <div className="mb-16">
            <span className="text-3xl font-bold">비밀번호 변경</span>
          </div>
          <form onSubmit={handleSubmit(onValid)}>
            <div className="mt-2 mb-10">
              <label htmlFor="original-password">기존 비밀번호</label>
              <input
                id="original-password"
                type="password"
                className="w-full rounded-full h-11 px-4 border border-main-gray"
                placeholder="기존 비밀번호 입력"
                {...register('originalPassword', {
                  required: '기존 비밀번호는 필수 입력 사항입니다',
                  pattern: {
                    value:
                      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()+|=])[A-Za-z\d~!@#$%^&*()+|=]{8,16}$/i,
                    message:
                      '비밀번호는 8~16자, 영어 대소문자,특수문자가 포함되어야 합니다',
                  },
                })}
              />
              {errors.originalPassword && (
                <p className="font-semibold text-red-500 text-sm text-center">
                  {errors.originalPassword.message}
                </p>
              )}
            </div>
            <div className="mt-2 mb-10">
              <label htmlFor="new-password">신규 비밀번호</label>
              <input
                id="new-password"
                type="password"
                className="w-full rounded-full h-11 px-4 border border-main-gray"
                placeholder="신규 비밀번호 입력"
                {...register('newPassword', {
                  required: '신규 비밀번호는 필수 입력 사항입니다',
                  pattern: {
                    value:
                      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()+|=])[A-Za-z\d~!@#$%^&*()+|=]{8,16}$/i,
                    message:
                      '비밀번호는 8~16자, 영어 대소문자,특수문자가 포함되어야 합니다',
                  },
                })}
              />
              {errors.newPassword && (
                <p className="font-semibold text-red-500 text-sm text-center">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="mt-2 mb-10">
              <label htmlFor="new-password-check">신규 비밀번호 확인</label>
              <input
                id="new-password-check"
                type="password"
                className="w-full rounded-full h-11 px-4 border border-main-gray"
                placeholder="신규 비밀번호 확인"
                {...register('newPasswordCheck', {
                  required: '신규 비밀번호 확인은 필수 입력 사항입니다',
                  pattern: {
                    value:
                      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()+|=])[A-Za-z\d~!@#$%^&*()+|=]{8,16}$/i,
                    message:
                      '비밀번호는 8~16자, 영어 대소문자,특수문자가 포함되어야 합니다',
                  },
                })}
              />
              {errors.newPasswordCheck && (
                <p className="font-semibold text-red-500 text-sm text-center">
                  {errors.newPasswordCheck.message}
                </p>
              )}
            </div>
            <div className="flex gap-8">
              <button className="w-full py-[6px] rounded-full bg-main-yellow">
                변경
              </button>
              <Link href="/">
                <div className="w-full py-[6px] rounded-full bg-main-gray hover:cursor-pointer flex justify-center">
                  <span>취소</span>
                </div>
              </Link>
            </div>
          </form>
        </>
      ) : pathname === '/membership-withdrawal' ? (
        <>
          <div className="mb-16">
            <span className="text-3xl font-bold">회원 탈퇴</span>
          </div>
          <form onSubmit={onSubmitMembershipWithdrawal}>
            <label htmlFor="password">비밀번호 입력</label>
            <input
              id="password"
              type="password"
              className="w-full rounded-full h-11 px-4 mt-2 mb-10 border border-main-gray"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-8">
              <button className="w-full py-[6px] rounded-full bg-main-yellow">
                탈퇴
              </button>
              <Link href="/">
                <div className="w-full py-[6px] rounded-full bg-main-gray hover:cursor-pointer flex justify-center">
                  <span>취소</span>
                </div>
              </Link>
            </div>
          </form>
        </>
      ) : (
        <h1>올바르지 않은 접근입니다</h1>
      )}
    </>
  );
};
