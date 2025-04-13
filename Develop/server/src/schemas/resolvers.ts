// import user model
import User from "../models/User.js";
// import sign token function from auth
import { signToken } from "../services/auth.js";

const resolvers = {
  Query: {
    getSingleUser: async (_parent: any, args: any, context: any) => {
      const foundUser = await User.findOne({ _id: args.id });

      if (!foundUser) {
        return null;
      }

      return foundUser;
    },
  },
  Mutation: {
    createUser: async (_parent: any, args: any, context: any) => {
      const user = await User.create(req.body);

      if (!user) {
        return res.status(400).json({ message: "Something is wrong!" });
      }
      const token = signToken(user.username, user.password, user._id);
      return res.json({ token, user });
    },
    login: async (_parent: any, args: any, context: any) => {
      const user = await User.findOne({
        $or: [{ username: req.body.username }, { email: req.body.email }],
      });
      if (!user) {
        return res.status(400).json({ message: "Can't find this user" });
      }

      const correctPw = await user.isCorrectPassword(req.body.password);

      if (!correctPw) {
        return res.status(400).json({ message: "Wrong password!" });
      }
      const token = signToken(user.username, user.password, user._id);
      return res.json({ token, user });
    },

    saveBook: async (_parent: any, args: any, context: any) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: req.user._id },
          { $addToSet: { savedBooks: req.body } },
          { new: true, runValidators: true }
        );
        return res.json(updatedUser);
      } catch (err) {
        console.log(err);
        return res.status(400).json(err);
      }
    },

    deleteBook: async (_parent: any, args: any, context: any) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { savedBooks: { bookId: req.params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: "Couldn't find user with this id!" });
      }
      return res.json(updatedUser);
    },
  },
};

export default resolvers;
