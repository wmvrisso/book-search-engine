// import user model
import User from "../models/User.js";
// import sign token function from auth
import { signToken } from "../services/auth.js";

const resolvers = {
  Query: {
    getSingleUser: async (_parent: any, _args: any, context: any) => {
      const foundUser = await User.findOne({ _id: context.user._id });

      if (!foundUser) {
        return null;
      }

      return foundUser;
    },
  },
  Mutation: {
    addUser: async (_parent: any, args: any) => {
      const user = await User.create(args);

      if (!user) {
        return { message: "Something is wrong!" };
      }
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },
    login: async (_parent: any, args: any) => {
      const user = await User.findOne({
        $or: [{ username: args.username }, { email: args.email }],
      });
      if (!user) {
        return { message: "Can't find this user" };
      }

      const correctPw = await user.isCorrectPassword(args.password);

      if (!correctPw) {
        return { message: "Wrong password!" };
      }
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    saveBook: async (_parent: any, args: any, context: any) => {
      // check if user is logged in
      if (!context.user) {
        throw new Error("You need to be logged in!");
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.bookData } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    deleteBook: async (_parent: any, args: any, context: any) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return { message: "Couldn't find user with this id!" };
      }
      return updatedUser;
    },
  },
};

export default resolvers;
