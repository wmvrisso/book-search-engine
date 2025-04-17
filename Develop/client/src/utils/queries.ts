import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetSingleUser {
    getSingleUser {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;
