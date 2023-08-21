import { Credentials } from "../../graphql/auth/schema";
import { SuperTest, Test } from "supertest";

export const molly = {
  email: "molly@books.com",
  password: "mollymember",
};

  export const anna = {
  email: "anna@books.com",
  password: "annaadmin",
};

const nobby = {
      email: "nobby@books.com",
  password: "nobbynobody",
};

async function login(
  request: SuperTest<Test>,
  member: Credentials,
): Promise<string> {
  let accessToken = "";
  await request
    .post("/api/graphql")
    .send({
      query: `{login(email: "${member.email}" password: 
      "${member.password}") { accessToken }}`,
    })
    .expect(200)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((res: any) => {
      accessToken = res.body.data.login.accessToken;
    });
  return accessToken;
}

export async function asMolly(request: SuperTest<Test>): Promise<string> {
  return login(request, molly);
}

export async function asAnna(
  request: SuperTest<Test>,
): Promise<string | undefined> {
  return login(request, anna);
}

export async function asNobby(request: SuperTest<Test>): Promise<string> {
  return login(request, nobby);
}
