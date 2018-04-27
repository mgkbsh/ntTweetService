'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fname: { type: DataTypes.STRING },
    lname: { type: DataTypes.STRING },
    email: {
      type: DataTypes.STRING,
      allowEmpty: false,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowEmpty: false,
      allowNull: false,
      validate: {
        len: {
          args: 3
        }
      }
    },
    username:  {
      type: DataTypes.STRING,
      allowEmpty: false,
      unique: true,
      allowNull: false,
    },
    numFollowers: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    numFollowees: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    numTweets: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  } , {
    defaultScope: {
      order: [['createdAt', 'desc']]
    },
    getterMethods: {
      fullName: function() {
        return this.fname + ' ' + this.lname
      }
    }
  });

  User.associate = function (models) {
    User.hasMany(models.Tweet);
    User.hasMany(models.Relationship);
    User.hasMany(models.Mention);
    User.hasMany(models.Like);
  };

  return User;
};
