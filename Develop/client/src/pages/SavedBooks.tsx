import { Container, Card, Button, Row, Col } from "react-bootstrap";

import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

import { useMutation, useQuery } from "@apollo/client";
import { REMOVE_BOOK } from "../utils/mutations";
import { GET_ME } from "../utils/queries";

const SavedBooks = () => {
  const { data, loading } = useQuery(GET_ME);

  // use this to determine if `useEffect()` hook needs to run again

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const [removeBook] = useMutation(REMOVE_BOOK, {
    update(cache, { data }) {
      try {
        const { me } = cache.readQuery({ query: GET_ME }) as any;
        cache.writeQuery({
          query: GET_ME,
          data: {
            me: {
              ...me,
              savedBooks: me.savedBooks.filter(
                (book: any) => book.bookId !== data.removeBook.bookId
              ),
            },
          },
        });
      } catch (e) {
        console.error("Error updating cache after removing book:", e);
      }
    },
  });

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  const userData = data.getSingleUser;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {data.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <Row>
          {userData.savedBooks.map((book: any) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border="dark">
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className="btn-block btn-danger"
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
