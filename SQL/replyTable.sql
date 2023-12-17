CREATE TABLE `anidubsbd`.`anime_2_replies` (
  `comment_id` INT NOT NULL,
  `user_id` INT NULL,
  `reply` VARCHAR(2000) NULL,
  PRIMARY KEY (`comment_id`),
  CONSTRAINT `foreign_commentid`
    FOREIGN KEY (`comment_id`)
    REFERENCES `anidubsbd`.`anime_2_comments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
