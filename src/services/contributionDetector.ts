import { Commit } from 'nodegit';
import { ContributionInterface } from '../model/types';
import SyntaxParser from './syntaxParser';

export default class ContributionDetector {
  public static async detectHealersAndScoutFromCommit(commit: Commit): Promise<ContributionInterface> {
    const contributionScore: ContributionInterface = {
      healerScore: 0,
      scoutScore: 0,
    };

    const diffs = await commit.getDiff();
    for (const diff of diffs) {
      const patches = await diff.patches();
      for (const patch of patches) {
        const hunks = await patch.hunks();
        for (const oneHunk of hunks) {
          let lines = await oneHunk.lines();
          lines = lines.filter((line): boolean => SyntaxParser.isComment(line.content()));
          for (const line of lines) {
            const debtTag = SyntaxParser.getTag(line.content(), SyntaxParser.debtTags);

            if (debtTag != null) {
              if (line.newLineno() < 0) {
                contributionScore.healerScore++;
              }

              if (line.oldLineno() < 0) {
                contributionScore.scoutScore++;
              }
            }
          }
        }
      }
    }
    return contributionScore;
  }
}
