import bcrypt from "bcryptjs";
import { client } from "~/plugin/sanity";
import { GET_PASSWORD_BY_ID } from "~/schema/query/auth";

export const comparePassword = async (_id: string, password: string) => {
    const data = await client.fetch<{ password: string }>(GET_PASSWORD_BY_ID, {
        _id,
    });
    const isMatch = bcrypt.compareSync(password, data.password);
    return isMatch;
};
